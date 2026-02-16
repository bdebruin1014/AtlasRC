import React, { useState, useEffect } from 'react';
import { getCalendarEvents, createCalendarEvent } from '@/services/outlookService';
import { getOutlookConnection } from '@/services/outlookService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Calendar,
  Plus,
  MapPin,
  Users,
  ExternalLink,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Settings,
} from 'lucide-react';

// ============================================
// HELPERS
// ============================================

function isToday(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function isThisWeek(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return date >= startOfWeek && date < endOfWeek;
}

function isPast(dateString) {
  return new Date(dateString) < new Date();
}

function formatEventDateTime(start, end) {
  const startDate = new Date(start?.dateTime || start);
  const endDate = new Date(end?.dateTime || end);

  const dateOpts = { weekday: 'short', month: 'short', day: 'numeric' };
  const timeOpts = { hour: 'numeric', minute: '2-digit' };

  const dateStr = startDate.toLocaleDateString(undefined, dateOpts);
  const startTime = startDate.toLocaleTimeString(undefined, timeOpts);
  const endTime = endDate.toLocaleTimeString(undefined, timeOpts);

  return `${dateStr} · ${startTime} - ${endTime}`;
}

function getEventColorClasses(start) {
  const dateTime = start?.dateTime || start;
  if (isToday(dateTime)) {
    return {
      border: 'border-emerald-200',
      bg: 'bg-emerald-50',
      badge: 'bg-emerald-100 text-emerald-800',
      label: 'Today',
    };
  }
  if (isThisWeek(dateTime)) {
    return {
      border: 'border-blue-200',
      bg: 'bg-blue-50',
      badge: 'bg-blue-100 text-blue-800',
      label: 'This Week',
    };
  }
  return {
    border: 'border-gray-200',
    bg: 'bg-white',
    badge: 'bg-gray-100 text-gray-600',
    label: 'Upcoming',
  };
}

// ============================================
// COMPONENT
// ============================================

export default function ProjectCalendarSection({ projectId }) {
  const { user } = useAuth();
  const { toast } = useToast();

  // Connection state
  const [isConnected, setIsConnected] = useState(null); // null = loading, true/false
  const [connectionLoading, setConnectionLoading] = useState(true);

  // Events state
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState(null);

  // Create form state
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    startDateTime: '',
    endDateTime: '',
    location: '',
    body: '',
    attendees: '',
  });

  // Check Outlook connection on mount
  useEffect(() => {
    if (!user?.id) return;

    async function checkConnection() {
      setConnectionLoading(true);
      try {
        const { data } = await getOutlookConnection(user.id);
        setIsConnected(data?.is_connected === true);
      } catch {
        setIsConnected(false);
      } finally {
        setConnectionLoading(false);
      }
    }

    checkConnection();
  }, [user?.id]);

  // Fetch calendar events once connected
  useEffect(() => {
    if (!user?.id || !isConnected) return;

    async function fetchEvents() {
      setEventsLoading(true);
      setEventsError(null);
      try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const sixtyDaysOut = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

        const { data, error } = await getCalendarEvents(user.id, {
          startDateTime: thirtyDaysAgo.toISOString(),
          endDateTime: sixtyDaysOut.toISOString(),
          top: 100,
        });

        if (error) throw error;
        setEvents(data || []);
      } catch (err) {
        console.error('Error loading calendar events:', err);
        setEventsError(err.message || 'Failed to load calendar events');
      } finally {
        setEventsLoading(false);
      }
    }

    fetchEvents();
  }, [user?.id, isConnected]);

  // ============================================
  // COMPUTED KPIs
  // ============================================

  const now = new Date();
  const upcomingEvents = events.filter(
    (e) => new Date(e.start?.dateTime || e.start) >= now
  );
  const thisWeekEvents = events.filter((e) =>
    isThisWeek(e.start?.dateTime || e.start)
  );
  const meetingEvents = upcomingEvents.filter(
    (e) => (e.attendees && e.attendees.length > 0)
  );
  const overdueEvents = events.filter((e) => {
    const endTime = e.end?.dateTime || e.end;
    return isPast(endTime) && new Date(endTime) >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  });

  const kpis = [
    { label: 'Upcoming Events', value: String(upcomingEvents.length) },
    { label: 'This Week', value: String(thisWeekEvents.length) },
    { label: 'Meetings', value: String(meetingEvents.length) },
    { label: 'Overdue', value: String(overdueEvents.length) },
  ];

  // ============================================
  // FORM HANDLERS
  // ============================================

  function handleFormChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function resetForm() {
    setFormData({
      subject: '',
      startDateTime: '',
      endDateTime: '',
      location: '',
      body: '',
      attendees: '',
    });
  }

  async function handleCreateEvent(e) {
    e.preventDefault();
    if (!formData.subject || !formData.startDateTime || !formData.endDateTime) return;

    setCreating(true);
    try {
      const attendeeList = formData.attendees
        .split(',')
        .map((email) => email.trim())
        .filter(Boolean)
        .map((email) => ({ email, name: email }));

      const eventPayload = {
        subject: formData.subject,
        startDateTime: formData.startDateTime,
        endDateTime: formData.endDateTime,
        location: formData.location || undefined,
        body: formData.body || undefined,
        attendees: attendeeList.length > 0 ? attendeeList : undefined,
      };

      const { data, error } = await createCalendarEvent(user.id, eventPayload);
      if (error) throw error;

      // Refresh events list
      const sixtyDaysOut = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const { data: refreshed } = await getCalendarEvents(user.id, {
        startDateTime: sevenDaysAgo.toISOString(),
        endDateTime: sixtyDaysOut.toISOString(),
        top: 100,
      });
      setEvents(refreshed || []);

      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error('Error creating event:', err);
      toast({ title: 'Error', description: err.message || 'Failed to create event', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  }

  // ============================================
  // CONNECTION REQUIRED STATE
  // ============================================

  if (connectionLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400 mr-3" />
          <span className="text-gray-500">Checking Outlook connection...</span>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#047857]" />
            Project Calendar
          </h2>
        </div>

        {/* Connection required message */}
        <div className="bg-white border rounded-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-amber-500" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Outlook Connection Required
          </h3>
          <p className="text-gray-500 mb-4 max-w-md mx-auto">
            Connect your Outlook account to view and manage calendar events for this project.
            Go to <span className="font-medium text-gray-700">Settings &gt; Integrations</span> to connect your account.
          </p>
          <Button variant="outline" className="gap-2">
            <Settings className="w-4 h-4" />
            Go to Settings
          </Button>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================

  // Sort upcoming events by start date (soonest first)
  const sortedUpcoming = [...upcomingEvents].sort(
    (a, b) =>
      new Date(a.start?.dateTime || a.start) - new Date(b.start?.dateTime || b.start)
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#047857]" />
          Project Calendar
        </h2>
        <Button
          className="bg-[#047857] hover:bg-[#065f46]"
          onClick={() => setShowForm((prev) => !prev)}
        >
          {showForm ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              New Event
            </>
          )}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-500">{kpi.label}</p>
            <p className="text-2xl font-semibold">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Create Event Form (Collapsible) */}
      {showForm && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Create New Event</h3>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            {/* Subject */}
            <div>
              <Label htmlFor="event-subject">Subject</Label>
              <Input
                id="event-subject"
                placeholder="Event subject"
                value={formData.subject}
                onChange={(e) => handleFormChange('subject', e.target.value)}
                required
              />
            </div>

            {/* Date/Time Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event-start">Start Date/Time</Label>
                <Input
                  id="event-start"
                  type="datetime-local"
                  value={formData.startDateTime}
                  onChange={(e) => handleFormChange('startDateTime', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="event-end">End Date/Time</Label>
                <Input
                  id="event-end"
                  type="datetime-local"
                  value={formData.endDateTime}
                  onChange={(e) => handleFormChange('endDateTime', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="event-location">Location (optional)</Label>
              <Input
                id="event-location"
                placeholder="e.g. Conference Room A, or Teams meeting link"
                value={formData.location}
                onChange={(e) => handleFormChange('location', e.target.value)}
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="event-body">Description (optional)</Label>
              <Textarea
                id="event-body"
                placeholder="Add details about this event..."
                rows={3}
                value={formData.body}
                onChange={(e) => handleFormChange('body', e.target.value)}
              />
            </div>

            {/* Attendees */}
            <div>
              <Label htmlFor="event-attendees">Attendee Emails (comma-separated)</Label>
              <Input
                id="event-attendees"
                placeholder="e.g. john@company.com, jane@company.com"
                value={formData.attendees}
                onChange={(e) => handleFormChange('attendees', e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                className="bg-[#047857] hover:bg-[#065f46]"
                disabled={creating || !formData.subject || !formData.startDateTime || !formData.endDateTime}
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Event'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Events List */}
      {eventsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400 mr-3" />
          <span className="text-gray-500">Loading calendar events...</span>
        </div>
      ) : eventsError ? (
        <div className="bg-white border rounded-lg p-8 text-center">
          <AlertCircle className="w-10 h-10 text-red-300 mx-auto mb-2" />
          <p className="text-gray-500">{eventsError}</p>
        </div>
      ) : sortedUpcoming.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 text-center">
          <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">
            No upcoming events found. Click "New Event" to create one.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedUpcoming.map((event) => {
            const colors = getEventColorClasses(event.start);
            return (
              <div
                key={event.id}
                className={`border ${colors.border} ${colors.bg} rounded-lg p-4 hover:shadow-sm transition-shadow`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Subject + Badge */}
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {event.subject}
                      </h4>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${colors.badge}`}
                      >
                        {colors.label}
                      </span>
                    </div>

                    {/* Date/Time */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatEventDateTime(event.start, event.end)}</span>
                    </div>

                    {/* Location */}
                    {event.location && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{event.location}</span>
                      </div>
                    )}

                    {/* Attendees */}
                    {event.attendees && event.attendees.length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>
                          {event.attendees
                            .map((a) => a.name || a.email)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Web Link */}
                  {event.webLink && (
                    <a
                      href={event.webLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-3 flex-shrink-0 text-gray-400 hover:text-[#047857] transition-colors"
                      title="Open in Outlook"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
