// src/components/accounting/LogCommunicationModal.jsx
// Modal for logging manual communications (calls, meetings, notes)

import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  MessageSquare, Phone, Video, Users, FileText, Mail,
  Loader2, AlertCircle, Calendar, Clock, User
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const COMMUNICATION_TYPES = [
  { value: 'phone_call', label: 'Phone Call', icon: Phone, color: 'text-green-600' },
  { value: 'video_call', label: 'Video Call', icon: Video, color: 'text-blue-600' },
  { value: 'meeting', label: 'In-Person Meeting', icon: Users, color: 'text-purple-600' },
  { value: 'email', label: 'Email (Manual)', icon: Mail, color: 'text-amber-600' },
  { value: 'note', label: 'Internal Note', icon: FileText, color: 'text-gray-600' },
];

const DIRECTIONS = [
  { value: 'inbound', label: 'Inbound (Received)' },
  { value: 'outbound', label: 'Outbound (Sent/Made)' },
  { value: 'internal', label: 'Internal' },
];

const OUTCOMES = [
  { value: 'completed', label: 'Completed' },
  { value: 'left_message', label: 'Left Message' },
  { value: 'no_answer', label: 'No Answer' },
  { value: 'busy', label: 'Busy' },
  { value: 'scheduled_followup', label: 'Scheduled Follow-up' },
  { value: 'action_required', label: 'Action Required' },
];

export default function LogCommunicationModal({ open, onClose, entityId }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    type: 'phone_call',
    direction: 'outbound',
    subject: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    duration_minutes: '',
    outcome: 'completed',
    notes: '',
    follow_up_date: '',
    follow_up_notes: '',
  });

  // Fetch entity contacts for quick selection
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
        type: 'phone_call',
        direction: 'outbound',
        subject: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        duration_minutes: '',
        outcome: 'completed',
        notes: '',
        follow_up_date: '',
        follow_up_notes: '',
      });
      setError(null);
    }
  }, [open]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const selectContact = (contact) => {
    setFormData(prev => ({
      ...prev,
      contact_name: contact.name || '',
      contact_email: contact.email || '',
      contact_phone: contact.phone || '',
    }));
  };

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const communicationData = {
        entity_id: entityId,
        type: data.type,
        direction: data.direction,
        subject: data.subject || `${COMMUNICATION_TYPES.find(t => t.value === data.type)?.label} with ${data.contact_name}`,
        contact_name: data.contact_name || null,
        contact_email: data.contact_email || null,
        contact_phone: data.contact_phone || null,
        communication_date: `${data.date}T${data.time}:00`,
        duration_minutes: data.duration_minutes ? parseInt(data.duration_minutes) : null,
        outcome: data.outcome,
        notes: data.notes || null,
        follow_up_date: data.follow_up_date || null,
        follow_up_notes: data.follow_up_notes || null,
        logged_by: user?.id,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('entity_communications')
        .insert([communicationData]);

      if (error) throw error;

      // Create follow-up task if specified
      if (data.follow_up_date) {
        await supabase.from('entity_tasks').insert({
          entity_id: entityId,
          title: `Follow-up: ${data.subject || data.contact_name}`,
          description: data.follow_up_notes || `Follow-up from ${COMMUNICATION_TYPES.find(t => t.value === data.type)?.label}`,
          due_date: data.follow_up_date,
          priority: 'medium',
          status: 'pending',
          assigned_to: user?.id,
          created_at: new Date().toISOString(),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['entity-communications', entityId]);
      queryClient.invalidateQueries(['entity-tasks', entityId]);
      onClose();
    },
    onError: (err) => {
      setError(err.message || 'Failed to log communication');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.type) {
      setError('Communication type is required');
      return;
    }
    if (!formData.contact_name && formData.type !== 'note') {
      setError('Contact name is required');
      return;
    }

    saveMutation.mutate(formData);
  };

  const selectedType = COMMUNICATION_TYPES.find(t => t.value === formData.type);
  const TypeIcon = selectedType?.icon || MessageSquare;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Log Communication
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Type Selection */}
          <div className="space-y-2">
            <Label>Communication Type *</Label>
            <div className="grid grid-cols-5 gap-2">
              {COMMUNICATION_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleChange('type', type.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors",
                      formData.type === type.value
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:bg-muted/50"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", type.color)} />
                    <span className="text-xs text-center">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direction */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Direction</Label>
              <Select
                value={formData.direction}
                onValueChange={(value) => handleChange('direction', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIRECTIONS.map((dir) => (
                    <SelectItem key={dir.value} value={dir.value}>
                      {dir.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Outcome</Label>
              <Select
                value={formData.outcome}
                onValueChange={(value) => handleChange('outcome', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OUTCOMES.map((outcome) => (
                    <SelectItem key={outcome.value} value={outcome.value}>
                      {outcome.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact Info */}
          {formData.type !== 'note' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Contact Information</Label>
                {contacts.length > 0 && (
                  <Select onValueChange={(id) => {
                    const contact = contacts.find(c => c.id === id);
                    if (contact) selectContact(contact);
                  }}>
                    <SelectTrigger className="w-[180px] h-8 text-xs">
                      <SelectValue placeholder="Select contact" />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Name *</Label>
                  <Input
                    value={formData.contact_name}
                    onChange={(e) => handleChange('contact_name', e.target.value)}
                    placeholder="Contact name"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <Input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <Input
                    value={formData.contact_phone}
                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              placeholder="Brief description of the communication"
            />
          </div>

          {/* Date, Time, Duration */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (min)</Label>
              <Input
                id="duration"
                type="number"
                min="0"
                value={formData.duration_minutes}
                onChange={(e) => handleChange('duration_minutes', e.target.value)}
                placeholder="e.g., 15"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Details of the communication..."
              rows={4}
            />
          </div>

          {/* Follow-up */}
          <div className="border-t pt-4 space-y-3">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule Follow-up (Optional)
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Follow-up Date</Label>
                <Input
                  type="date"
                  value={formData.follow_up_date}
                  onChange={(e) => handleChange('follow_up_date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Follow-up Notes</Label>
                <Input
                  value={formData.follow_up_notes}
                  onChange={(e) => handleChange('follow_up_notes', e.target.value)}
                  placeholder="What to follow up on..."
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Log Communication
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
