// src/components/accounting/ComposeEmailModal.jsx
// Modal for composing and sending emails via Outlook

import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Mail, Send, Paperclip, X, Loader2, AlertCircle, Plus,
  ChevronDown, ChevronUp, User, Trash2
} from 'lucide-react';
import { sendEmail, getOutlookConnection } from '@/services/outlookService';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

// Email templates for accounting
const EMAIL_TEMPLATES = [
  { id: 'blank', label: 'Blank Email', subject: '', body: '' },
  { id: 'payment_reminder', label: 'Payment Reminder', subject: 'Payment Reminder - Invoice Due', body: 'Dear [Name],\n\nThis is a friendly reminder that your invoice is due. Please remit payment at your earliest convenience.\n\nThank you for your prompt attention to this matter.\n\nBest regards,' },
  { id: 'statement_request', label: 'Statement Request', subject: 'Request for Account Statement', body: 'Dear [Name],\n\nWe kindly request a copy of our current account statement for reconciliation purposes.\n\nPlease send the statement to this email address at your earliest convenience.\n\nThank you,' },
  { id: 'document_request', label: 'Document Request', subject: 'Request for Documentation', body: 'Dear [Name],\n\nWe are requesting the following documents for our records:\n\n- [Document 1]\n- [Document 2]\n\nPlease provide these at your earliest convenience.\n\nThank you,' },
  { id: 'confirmation', label: 'Confirmation', subject: 'Confirmation', body: 'Dear [Name],\n\nThis email confirms the following:\n\n[Details]\n\nPlease let us know if you have any questions.\n\nBest regards,' },
];

export default function ComposeEmailModal({ open, onClose, entityId, replyTo, forwardFrom }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [error, setError] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [formData, setFormData] = useState({
    to: [],
    cc: [],
    bcc: [],
    subject: '',
    body: '',
    importance: 'normal',
    template: 'blank',
  });
  const [toInput, setToInput] = useState('');
  const [ccInput, setCcInput] = useState('');
  const [bccInput, setBccInput] = useState('');

  // Check Outlook connection
  const { data: outlookConnection } = useQuery({
    queryKey: ['outlook-connection', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await getOutlookConnection(user.id);
      return data;
    },
    enabled: open && !!user?.id,
  });

  // Fetch entity contacts
  const { data: contacts = [] } = useQuery({
    queryKey: ['entity-contacts', entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entity_contacts')
        .select('*')
        .eq('entity_id', entityId)
        .order('name');

      if (error) throw error;
      return data || [];
    },
    enabled: open && !!entityId,
  });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        to: replyTo ? [{ email: replyTo.from?.email, name: replyTo.from?.name }] : [],
        cc: [],
        bcc: [],
        subject: replyTo ? `Re: ${replyTo.subject}` : forwardFrom ? `Fwd: ${forwardFrom.subject}` : '',
        body: forwardFrom ? `\n\n---------- Forwarded message ----------\n${forwardFrom.body}` : '',
        importance: 'normal',
        template: 'blank',
      });
      setToInput('');
      setCcInput('');
      setBccInput('');
      setShowCc(false);
      setShowBcc(false);
      setAttachments([]);
      setError(null);
    }
  }, [open, replyTo, forwardFrom]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleTemplateChange = (templateId) => {
    const template = EMAIL_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        template: templateId,
        subject: template.subject || prev.subject,
        body: template.body || prev.body,
      }));
    }
  };

  const addRecipient = (field, inputValue, setInputValue) => {
    const email = inputValue.trim();
    if (!email) return;

    // Basic email validation
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], { email, name: email.split('@')[0] }],
    }));
    setInputValue('');
    setError(null);
  };

  const removeRecipient = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const addContactAsRecipient = (contact) => {
    if (!contact.email) return;
    setFormData(prev => ({
      ...prev,
      to: [...prev.to, { email: contact.email, name: contact.name }],
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        setAttachments(prev => [...prev, {
          id: `${file.name}-${Date.now()}`,
          name: file.name,
          contentType: file.type,
          size: file.size,
          contentBytes: base64,
        }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeAttachment = (attachmentId) => {
    setAttachments(prev => prev.filter(a => a.id !== attachmentId));
  };

  const sendMutation = useMutation({
    mutationFn: async (data) => {
      if (!user?.id) throw new Error('User not authenticated');
      if (!outlookConnection?.is_connected) throw new Error('Outlook not connected');

      const emailData = {
        to: data.to,
        cc: data.cc.length > 0 ? data.cc : undefined,
        bcc: data.bcc.length > 0 ? data.bcc : undefined,
        subject: data.subject,
        body: data.body,
        importance: data.importance,
        isHtml: false,
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      const { success, error } = await sendEmail(user.id, emailData);
      if (!success) throw error;

      // Log the communication
      await supabase.from('entity_communications').insert({
        entity_id: entityId,
        type: 'email',
        direction: 'outbound',
        subject: data.subject,
        body: data.body,
        from_email: outlookConnection.email,
        to_emails: data.to.map(t => t.email),
        cc_emails: data.cc.map(c => c.email),
        sent_at: new Date().toISOString(),
        sent_by: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['entity-communications', entityId]);
      onClose();
    },
    onError: (err) => {
      setError(err.message || 'Failed to send email');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.to.length === 0) {
      setError('Please add at least one recipient');
      return;
    }
    if (!formData.subject.trim()) {
      setError('Subject is required');
      return;
    }

    sendMutation.mutate(formData);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isConnected = outlookConnection?.is_connected;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {replyTo ? 'Reply' : forwardFrom ? 'Forward' : 'New Email'}
          </DialogTitle>
        </DialogHeader>

        {!isConnected ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Outlook Not Connected</h3>
            <p className="text-muted-foreground mb-4">
              Connect your Outlook account in Settings to send emails.
            </p>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* From */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground w-16">From:</span>
              <span className="font-medium">{outlookConnection?.email}</span>
            </div>

            {/* To */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="w-16">To:</Label>
                <div className="flex-1 flex flex-wrap gap-1 p-2 border rounded-lg min-h-[40px]">
                  {formData.to.map((recipient, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {recipient.name || recipient.email}
                      <button
                        type="button"
                        onClick={() => removeRecipient('to', index)}
                        className="hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  <input
                    type="text"
                    value={toInput}
                    onChange={(e) => setToInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        addRecipient('to', toInput, setToInput);
                      }
                    }}
                    onBlur={() => toInput && addRecipient('to', toInput, setToInput)}
                    placeholder={formData.to.length === 0 ? 'Enter email address' : ''}
                    className="flex-1 min-w-[150px] outline-none bg-transparent text-sm"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCc(!showCc)}
                >
                  Cc
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBcc(!showBcc)}
                >
                  Bcc
                </Button>
              </div>

              {/* Quick add contacts */}
              {contacts.length > 0 && (
                <div className="flex items-center gap-2 ml-16">
                  <span className="text-xs text-muted-foreground">Quick add:</span>
                  <div className="flex flex-wrap gap-1">
                    {contacts.slice(0, 5).map((contact) => (
                      <button
                        key={contact.id}
                        type="button"
                        onClick={() => addContactAsRecipient(contact)}
                        className="text-xs px-2 py-0.5 bg-muted hover:bg-muted/80 rounded"
                      >
                        {contact.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cc */}
            {showCc && (
              <div className="flex items-center gap-2">
                <Label className="w-16">Cc:</Label>
                <div className="flex-1 flex flex-wrap gap-1 p-2 border rounded-lg min-h-[40px]">
                  {formData.cc.map((recipient, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {recipient.name || recipient.email}
                      <button
                        type="button"
                        onClick={() => removeRecipient('cc', index)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  <input
                    type="text"
                    value={ccInput}
                    onChange={(e) => setCcInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        addRecipient('cc', ccInput, setCcInput);
                      }
                    }}
                    className="flex-1 min-w-[150px] outline-none bg-transparent text-sm"
                  />
                </div>
              </div>
            )}

            {/* Bcc */}
            {showBcc && (
              <div className="flex items-center gap-2">
                <Label className="w-16">Bcc:</Label>
                <div className="flex-1 flex flex-wrap gap-1 p-2 border rounded-lg min-h-[40px]">
                  {formData.bcc.map((recipient, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {recipient.name || recipient.email}
                      <button
                        type="button"
                        onClick={() => removeRecipient('bcc', index)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  <input
                    type="text"
                    value={bccInput}
                    onChange={(e) => setBccInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        addRecipient('bcc', bccInput, setBccInput);
                      }
                    }}
                    className="flex-1 min-w-[150px] outline-none bg-transparent text-sm"
                  />
                </div>
              </div>
            )}

            {/* Subject */}
            <div className="flex items-center gap-2">
              <Label className="w-16">Subject:</Label>
              <Input
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                placeholder="Enter subject"
                className="flex-1"
              />
            </div>

            {/* Template & Importance */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-muted-foreground">Template:</Label>
                <Select value={formData.template} onValueChange={handleTemplateChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EMAIL_TEMPLATES.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-muted-foreground">Priority:</Label>
                <Select
                  value={formData.importance}
                  onValueChange={(value) => handleChange('importance', value)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Body */}
            <Textarea
              value={formData.body}
              onChange={(e) => handleChange('body', e.target.value)}
              placeholder="Write your message..."
              rows={10}
              className="resize-none"
            />

            {/* Attachments */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4 mr-1" />
                  Attach File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center gap-2 px-2 py-1 bg-muted rounded text-sm"
                    >
                      <Paperclip className="h-3 w-3" />
                      <span className="truncate max-w-[150px]">{att.name}</span>
                      <span className="text-muted-foreground text-xs">
                        ({formatSize(att.size)})
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(att.id)}
                        className="hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={sendMutation.isPending}>
                {sendMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
