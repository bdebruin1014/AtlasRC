// src/components/outlook/ProjectEmailPanel.jsx
// Qualia-style Email Panel for Project Portal

import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail, Send, Reply, ReplyAll, Forward, Trash2, Paperclip, Search,
  RefreshCw, Star, AlertCircle, Check, ChevronDown, X, Plus, Link2,
  Calendar, ExternalLink, Inbox, Archive, MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  getEmails,
  getEmail,
  sendEmail,
  replyToEmail,
  markAsRead,
  deleteEmail,
  linkEmailToProject,
  unlinkEmailFromProject,
  getProjectEmails,
  searchEmailsForProject,
  formatEmailDate,
  getEmailInitials,
  getOutlookConnection,
} from '@/services/outlookService';
import { supabase } from '@/lib/supabase';

const ProjectEmailPanel = ({
  projectId,
  projectName,
  projectContacts = [],
  className,
}) => {
  const [userId, setUserId] = useState(null);
  const [connection, setConnection] = useState(null);
  const [emails, setEmails] = useState([]);
  const [linkedEmails, setLinkedEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [emailContent, setEmailContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('linked'); // 'linked', 'inbox', 'search'
  const [showCompose, setShowCompose] = useState(false);
  const [composeMode, setComposeMode] = useState('new'); // 'new', 'reply', 'replyAll', 'forward'
  const [composeData, setComposeData] = useState({
    to: [],
    cc: [],
    subject: '',
    body: '',
  });
  const [sending, setSending] = useState(false);

  // Initialize
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: conn } = await getOutlookConnection(user.id);
        setConnection(conn);
      }
      setLoading(false);
    };
    init();
  }, []);

  // Load emails
  useEffect(() => {
    if (userId && connection?.is_connected && projectId) {
      loadLinkedEmails();
    }
  }, [userId, connection, projectId]);

  const loadLinkedEmails = async () => {
    const { data } = await getProjectEmails(projectId);
    setLinkedEmails(data || []);
  };

  const loadInboxEmails = async () => {
    if (!connection?.is_connected) return;

    setLoading(true);
    const { data } = await getEmails(userId, { top: 30 });
    setEmails(data || []);
    setLoading(false);
  };

  const searchEmails = async () => {
    if (!connection?.is_connected || !searchQuery) return;

    setLoading(true);
    const { data } = await getEmails(userId, { search: searchQuery, top: 30 });
    setEmails(data || []);
    setActiveTab('search');
    setLoading(false);
  };

  const loadEmailContent = async (emailId) => {
    setLoadingEmail(true);
    const { data } = await getEmail(userId, emailId);
    setEmailContent(data);
    setLoadingEmail(false);

    // Mark as read
    if (data && !data.isRead) {
      markAsRead(userId, emailId);
    }
  };

  const handleSelectEmail = (email) => {
    setSelectedEmail(email);
    if (email.email_id) {
      // Linked email - use stored email_id
      loadEmailContent(email.email_id);
    } else {
      // Inbox/search email
      loadEmailContent(email.id);
    }
  };

  const handleLinkEmail = async (email) => {
    const { error } = await linkEmailToProject(userId, email.id, projectId);
    if (!error) {
      loadLinkedEmails();
      // Show success feedback
    }
  };

  const handleUnlinkEmail = async (projectEmailId) => {
    if (!confirm('Remove this email from the project?')) return;
    const { error } = await unlinkEmailFromProject(projectEmailId);
    if (!error) {
      loadLinkedEmails();
      setSelectedEmail(null);
      setEmailContent(null);
    }
  };

  const handleDeleteEmail = async (emailId) => {
    if (!confirm('Move this email to trash?')) return;
    const { error } = await deleteEmail(userId, emailId);
    if (!error) {
      if (activeTab === 'inbox' || activeTab === 'search') {
        setEmails(emails.filter(e => e.id !== emailId));
      }
      setSelectedEmail(null);
      setEmailContent(null);
    }
  };

  const handleCompose = (mode = 'new', email = null) => {
    setComposeMode(mode);

    if (mode === 'new') {
      setComposeData({
        to: projectContacts.length > 0 ? [{ email: projectContacts[0], name: '' }] : [],
        cc: [],
        subject: `Re: ${projectName}`,
        body: '',
      });
    } else if (mode === 'reply' && email) {
      setComposeData({
        to: [email.from],
        cc: [],
        subject: email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`,
        body: `\n\n-------- Original Message --------\nFrom: ${email.from.name} <${email.from.email}>\nDate: ${formatEmailDate(email.receivedDateTime)}\nSubject: ${email.subject}\n\n`,
        inReplyTo: email.internetMessageId,
      });
    } else if (mode === 'replyAll' && email) {
      setComposeData({
        to: [email.from, ...email.to.filter(t => t.email !== connection.email)],
        cc: email.cc || [],
        subject: email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`,
        body: `\n\n-------- Original Message --------\nFrom: ${email.from.name} <${email.from.email}>\nDate: ${formatEmailDate(email.receivedDateTime)}\nSubject: ${email.subject}\n\n`,
        inReplyTo: email.internetMessageId,
      });
    } else if (mode === 'forward' && email) {
      setComposeData({
        to: [],
        cc: [],
        subject: email.subject.startsWith('Fwd:') ? email.subject : `Fwd: ${email.subject}`,
        body: `\n\n-------- Forwarded Message --------\nFrom: ${email.from.name} <${email.from.email}>\nDate: ${formatEmailDate(email.receivedDateTime)}\nSubject: ${email.subject}\n\n${email.body || ''}`,
      });
    }

    setShowCompose(true);
  };

  const handleSend = async () => {
    if (composeData.to.length === 0 || !composeData.subject) return;

    setSending(true);

    if (composeMode === 'reply' && selectedEmail) {
      await replyToEmail(userId, selectedEmail.id, {
        body: composeData.body,
        isHtml: false,
      });
    } else if (composeMode === 'replyAll' && selectedEmail) {
      await replyToEmail(userId, selectedEmail.id, {
        body: composeData.body,
        isHtml: false,
        replyAll: true,
      });
    } else {
      await sendEmail(userId, {
        to: composeData.to,
        cc: composeData.cc,
        subject: composeData.subject,
        body: composeData.body,
        isHtml: false,
      });
    }

    setSending(false);
    setShowCompose(false);
    setComposeData({ to: [], cc: [], subject: '', body: '' });

    // Refresh if in inbox view
    if (activeTab === 'inbox') {
      loadInboxEmails();
    }
  };

  const addRecipient = (field, email) => {
    if (!email) return;
    setComposeData(prev => ({
      ...prev,
      [field]: [...prev[field], { email, name: '' }],
    }));
  };

  const removeRecipient = (field, index) => {
    setComposeData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // Not connected state
  if (!connection?.is_connected) {
    return (
      <div className={cn("bg-white border rounded-lg p-8 text-center", className)}>
        <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h3 className="font-semibold mb-2">Connect Outlook</h3>
        <p className="text-sm text-gray-500 mb-4">
          Connect your Outlook account to view and send project emails directly from this portal.
        </p>
        <Button onClick={() => window.location.href = '/settings/integrations'}>
          Connect Outlook
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("bg-white border rounded-lg overflow-hidden h-[600px] flex", className)}>
      {/* Email List Panel */}
      <div className="w-80 border-r flex flex-col">
        {/* Toolbar */}
        <div className="p-3 border-b space-y-2">
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => handleCompose('new')}>
              <Plus className="w-4 h-4 mr-1" />
              Compose
            </Button>
            <Button variant="outline" size="sm" onClick={loadLinkedEmails}>
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search emails..."
              className="pl-9 h-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchEmails()}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => { setActiveTab('linked'); setSelectedEmail(null); }}
            className={cn(
              "flex-1 px-3 py-2 text-sm font-medium",
              activeTab === 'linked'
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Link2 className="w-4 h-4 inline mr-1" />
            Linked ({linkedEmails.length})
          </button>
          <button
            onClick={() => { setActiveTab('inbox'); loadInboxEmails(); setSelectedEmail(null); }}
            className={cn(
              "flex-1 px-3 py-2 text-sm font-medium",
              activeTab === 'inbox'
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Inbox className="w-4 h-4 inline mr-1" />
            Inbox
          </button>
        </div>

        {/* Email List */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="divide-y">
              {(activeTab === 'linked' ? linkedEmails : emails).map((email) => (
                <div
                  key={email.id}
                  onClick={() => handleSelectEmail(email)}
                  className={cn(
                    "p-3 cursor-pointer hover:bg-gray-50",
                    selectedEmail?.id === email.id && "bg-blue-50",
                    !email.isRead && "bg-blue-50/50"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0",
                      email.isRead ? "bg-gray-200 text-gray-600" : "bg-blue-100 text-blue-600"
                    )}>
                      {getEmailInitials(email.from || { name: email.from_name, email: email.from_email })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn(
                          "text-sm truncate",
                          !email.isRead && "font-semibold"
                        )}>
                          {email.from?.name || email.from_name || email.from?.email || email.from_email}
                        </span>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {formatEmailDate(email.receivedDateTime || email.received_at)}
                        </span>
                      </div>
                      <p className={cn(
                        "text-sm truncate",
                        !email.isRead ? "text-gray-900" : "text-gray-600"
                      )}>
                        {email.subject}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {email.preview || email.bodyPreview}
                      </p>
                    </div>
                    {email.hasAttachments && (
                      <Paperclip className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
              {(activeTab === 'linked' ? linkedEmails : emails).length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <Mail className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">
                    {activeTab === 'linked' ? 'No linked emails yet' : 'No emails found'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Email Content Panel */}
      <div className="flex-1 flex flex-col">
        {selectedEmail && emailContent ? (
          <>
            {/* Email Header */}
            <div className="p-4 border-b">
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-lg font-semibold">{emailContent.subject}</h2>
                <div className="flex items-center gap-1">
                  {activeTab !== 'linked' && (
                    <Button variant="ghost" size="sm" onClick={() => handleLinkEmail(selectedEmail)}>
                      <Link2 className="w-4 h-4" />
                    </Button>
                  )}
                  {activeTab === 'linked' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnlinkEmail(selectedEmail.id)}
                      className="text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {emailContent.webLink && (
                        <DropdownMenuItem onClick={() => window.open(emailContent.webLink, '_blank')}>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open in Outlook
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleDeleteEmail(selectedEmail.id || selectedEmail.email_id)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                  {getEmailInitials(emailContent.from)}
                </div>
                <div>
                  <p className="font-medium">{emailContent.from.name}</p>
                  <p className="text-gray-500">{emailContent.from.email}</p>
                </div>
                <span className="text-gray-400 ml-auto">
                  {formatEmailDate(emailContent.receivedDateTime)}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <span>To: {emailContent.to.map(t => t.email).join(', ')}</span>
                {emailContent.cc?.length > 0 && (
                  <span className="ml-3">Cc: {emailContent.cc.map(c => c.email).join(', ')}</span>
                )}
              </div>
            </div>

            {/* Email Actions */}
            <div className="px-4 py-2 border-b flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleCompose('reply', emailContent)}>
                <Reply className="w-4 h-4 mr-1" />
                Reply
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleCompose('replyAll', emailContent)}>
                <ReplyAll className="w-4 h-4 mr-1" />
                Reply All
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleCompose('forward', emailContent)}>
                <Forward className="w-4 h-4 mr-1" />
                Forward
              </Button>
            </div>

            {/* Email Body */}
            <div className="flex-1 overflow-auto p-4">
              {loadingEmail ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : emailContent.bodyType === 'HTML' ? (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: emailContent.body }}
                />
              ) : (
                <pre className="whitespace-pre-wrap font-sans text-sm">{emailContent.body}</pre>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Select an email to view</p>
            </div>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">
                {composeMode === 'new' ? 'New Message' :
                  composeMode === 'reply' ? 'Reply' :
                    composeMode === 'replyAll' ? 'Reply All' : 'Forward'}
              </h3>
              <button onClick={() => setShowCompose(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3 flex-1 overflow-auto">
              {/* To */}
              <div>
                <label className="text-sm font-medium text-gray-700">To:</label>
                <div className="flex flex-wrap gap-1 p-2 border rounded-md min-h-[40px]">
                  {composeData.to.map((recipient, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                      {recipient.email}
                      <button onClick={() => removeRecipient('to', idx)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <Input
                    className="flex-1 min-w-[150px] border-0 p-0 h-7 focus-visible:ring-0"
                    placeholder="Add recipient..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        addRecipient('to', e.target.value.trim());
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="text-sm font-medium text-gray-700">Subject:</label>
                <Input
                  value={composeData.subject}
                  onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>

              {/* Body */}
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700">Message:</label>
                <textarea
                  className="w-full border rounded-md p-3 min-h-[200px] resize-none"
                  value={composeData.body}
                  onChange={(e) => setComposeData(prev => ({ ...prev, body: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <Button variant="outline" onClick={() => setShowCompose(false)}>
                Cancel
              </Button>
              <Button onClick={handleSend} disabled={sending || composeData.to.length === 0}>
                {sending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-1" />
                    Send
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectEmailPanel;
